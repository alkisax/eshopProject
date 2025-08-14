import GoogleLogin from "./loginGoogle/GoogleLogin"
import LoginAppwriteLogin from "./loginAppwrite/LoginAppwrite"
import LoginBackend from "./loginBackend/LoginBackend"

interface params {
  url: string
}

const Login = ({ url }: params) => {

  return (
    <>
      <LoginBackend url={url} />
      <LoginAppwriteLogin url={url} />
      <GoogleLogin url={url} />
    </>
  )
}

export default Login