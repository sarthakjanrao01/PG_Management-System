import { Outlet } from 'react-router-dom'
import Header from './Client/Components/Header/Header'
import Footer from './Client/Components/Footer/Footer'

function App() {

  return (
    <>
    <Header/>
    <Outlet/>
    <Footer/>
    </>
  )
}

export default App
