import { Link } from "react-router-dom"

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <Link to="/">Home</Link>
      <Link to="/theaters">Theaters</Link>
    </div>
  )
}

export default Home
