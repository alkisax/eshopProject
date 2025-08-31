import { Button } from "@mui/material"
import { useNavigate } from "react-router-dom"

const Home =() => {
  const navigate = useNavigate()

  return (
    <>
      <h1>home</h1> 
      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => navigate("/store")}
      >
        Go to Store
      </Button>
    </>
  )
}
export default Home