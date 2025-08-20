import { createFileRoute } from '@tanstack/react-router'
import '../App.css'
import { useState } from 'react'
import axios from 'axios'

export const Route = createFileRoute('/')({
  component: App,
})

type products = {
  id: number
  name: string
  price: number
  imageUrl : string
  description : string
  createdAt : string
  updatedAt : String
}

function App() {
  const [uuids,setUuids] = useState<products[]>([])

  const handleButton = async () => {
    const res = await axios.get("/api/v1/products")
    setUuids((prev) => [...prev,...res.data])
  }

  return (
    <div className="App">
      <button onClick={handleButton}>
        Hello world
      </button>
      <br></br>
      {uuids.map((product, index) => (
        <div key={product.id || index}>
          <h3>{product.name}</h3>
          <p>Price: ${product.price}</p>
          <p>{product.description}</p>
        </div>
      ))}
    </div>
  )
}
