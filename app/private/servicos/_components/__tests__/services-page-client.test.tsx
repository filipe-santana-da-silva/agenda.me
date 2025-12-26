import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ServicesPageClient } from '../services-page-client'
import { toast } from 'sonner'

// Mock do Supabase
jest.mock('@/utils/supabase/client')
jest.mock('sonner')

const mockSupabaseClient = {
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      order: jest.fn().mockResolvedValue({
        data: [
          {
            id: '1',
            name: 'Corte Simples',
            duration: '00:30:00',
            price: 5000,
            created_at: '2025-01-01',
          },
          {
            id: '2',
            name: 'Barba',
            duration: '00:20:00',
            price: 2000,
            created_at: '2025-01-01',
          },
        ],
        error: null,
      }),
    }),
    delete: jest.fn(),
    eq: jest.fn(),
  }),
}

jest.mock('@/utils/supabase/client', () => ({
  createClient: () => mockSupabaseClient,
}))

describe('ServicesPageClient', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: [
            {
              id: '1',
              name: 'Corte Simples',
              duration: '00:30:00',
              price: 5000,
              created_at: '2025-01-01',
            },
          ],
          error: null,
        }),
      }),
    })
  })

  it('should render the services page title', () => {
    render(<ServicesPageClient />)
    expect(screen.getByText('Serviços')).toBeInTheDocument()
  })

  it('should load services on mount', async () => {
    render(<ServicesPageClient />)

    await waitFor(() => {
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('services')
    })
  })

  it('should display loaded services in the table', async () => {
    render(<ServicesPageClient />)

    await waitFor(() => {
      expect(screen.getByText('Corte Simples')).toBeInTheDocument()
    })
  })

  it('should show error toast when loading fails', async () => {
    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Network error'),
        }),
      }),
    })

    render(<ServicesPageClient />)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled()
    })
  })

  it('should have a button to add new service', async () => {
    render(<ServicesPageClient />)
    
    await waitFor(() => {
      const addButton = screen.queryByText('Novo Serviço')
      expect(addButton).toBeInTheDocument()
    })
  })

  it('should filter services by search term', async () => {
    render(<ServicesPageClient />)

    await waitFor(() => {
      expect(screen.getByText('Corte Simples')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/buscar/i)
    fireEvent.change(searchInput, { target: { value: 'Corte' } })

    // Após filtrar por "Corte", o teste deve continuar passando
    await waitFor(() => {
      expect(screen.getByText('Corte Simples')).toBeInTheDocument()
    })
  })
})
