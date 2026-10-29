import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from './App'

vi.mock('./lib/qr-generator', () => ({
  contrastRatio: () => 12,
  createQrDataUrl: vi.fn().mockResolvedValue('data:image/png;base64,qr-preview'),
  downloadName: () => 'qr-studio-example.com.png',
}))

describe('QR Studio', () => {
  it('shows validation feedback for an empty URL', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /create qr/i }))
    expect(screen.getByRole('alert')).toHaveTextContent(/enter a website address/i)
    expect(screen.getByRole('button', { name: /download png/i })).toBeDisabled()
  })
  it('clears the old preview as soon as the link draft changes', async () => {
    render(<App />)
    const input = screen.getByLabelText(/website address/i)
    fireEvent.change(input, { target: { value: 'example.com' } })
    fireEvent.click(screen.getByRole('button', { name: /create qr/i }))
    await waitFor(() => expect(screen.getByAltText(/QR code for https:\/\/example.com/i)).toBeInTheDocument())
    fireEvent.change(input, { target: { value: 'example.org' } })
    expect(screen.queryByAltText(/QR code/)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /download png/i })).toBeDisabled()
  })
  it('generates a preview for a normalized URL and allows palette/reset actions', async () => {
    render(<App />)
    fireEvent.change(screen.getByLabelText(/website address/i), { target: { value: 'example.com' } })
    fireEvent.click(screen.getByRole('button', { name: /create qr/i }))
    await waitFor(() => expect(screen.getByAltText(/QR code for https:\/\/example.com/i)).toBeInTheDocument())
    expect(screen.getByText('https://example.com/')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /ocean color palette/i }))
    expect(screen.getByLabelText(/foreground color/i)).toHaveValue('#073b5c')
    fireEvent.click(screen.getByRole('button', { name: /reset/i }))
    expect(screen.getByLabelText(/foreground color/i)).toHaveValue('#24124a')
  })
  it('starts a PNG download and announces completion', async () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    render(<App />)
    fireEvent.change(screen.getByLabelText(/website address/i), { target: { value: 'example.com' } })
    fireEvent.click(screen.getByRole('button', { name: /create qr/i }))
    const downloadButton = await screen.findByRole('button', { name: /download png/i })
    await waitFor(() => expect(downloadButton).toBeEnabled())
    fireEvent.click(downloadButton)
    expect(clickSpy).toHaveBeenCalledOnce()
    expect(screen.getByRole('status')).toHaveTextContent(/download started/i)
    clickSpy.mockRestore()
  })
})
