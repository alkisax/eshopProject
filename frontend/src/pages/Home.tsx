import Login from "../authLogin/Login";

interface Params {
  url: string
}
const Home =({ url }: Params) => {
  
  return (
    <>
      home
      <Login url={url} />
    </>
  )
}
export default Home