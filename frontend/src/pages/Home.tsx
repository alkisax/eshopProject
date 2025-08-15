import Login from "../authLogin/Login";

interface Params {
  url: string
}
const Home =({ url }: Params) => {
  
  return (
    <>
      <Login url={url} />
    </>
  )
}
export default Home