import { Outlet } from 'react-router-dom';
import Header from './Client/Components/Header/Header';
import Footer from './Client/Components/Footer/Footer';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      <Toaster position="top-right" reverseOrder={false} />
      <Header />
      <main className="flex-grow flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default App;
