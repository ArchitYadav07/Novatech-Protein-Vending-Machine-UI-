import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'vending-machine-api',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/api/minimize') {
            console.log('Received exit/minimize request, executing system close command...')
            
            // Create a temporary VBScript file that runs silently in the background
            // and sends the Alt + F4 key command to close the active kiosk window
            const tempVbsPath = path.join(process.cwd(), 'temp_close_kiosk.vbs')
            const vbsContent = `
              WScript.Sleep 100
              Set wShell = CreateObject("WScript.Shell")
              wShell.SendKeys "%{F4}"
            `
            
            try {
              fs.writeFileSync(tempVbsPath, vbsContent, 'utf-8')
              
              // wscript runs VBScript fully headlessly without spawning console window or stealing focus
              exec(`wscript.exe "${tempVbsPath}"`, (err) => {
                if (err) console.error('Error running VBScript:', err)
                
                // Clean up the temporary VBS file after a small delay
                setTimeout(() => {
                  if (fs.existsSync(tempVbsPath)) {
                    fs.unlinkSync(tempVbsPath)
                  }
                }, 1000)
              })
            } catch (writeErr) {
              console.error('Failed to create VBS script:', writeErr)
            }
            
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ status: 'success' }))
            return
          }
          next()
        })
      }
    }
  ],
  server: {
    port: 5173,
    strictPort: true,
    fs: {
      strict: false
    }
  }
})
