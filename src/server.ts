import app from './index.js'

const port = Number.parseInt(process.env.PORT ?? '3000', 10)

app.listen(port, () => {
    console.log(`GitHub Stats Generator listening on http://localhost:${port}`)
})
