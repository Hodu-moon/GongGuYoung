import { createFileRoute } from '@tanstack/react-router'
import '../App.css'
import { useState } from 'react'
import axios from 'axios'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const [uuids,setUuids] = useState<string[]>([])

  const handleButton = async () => {
    const res = await axios.get("/api/v1/products")
    setUuids((prev) => [...prev,res.data])
  }

  return (
    <div className="App">
      <button onClick={handleButton}>
        Hello world
      </button>
      <br></br>
      {uuids}
    </div>
  )
}
