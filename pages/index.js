import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="relative w-1/2 h-screen">
        <Image
          src="/MainScreen.png" // Make sure MainScreen.png is inside /public folder
          alt="CPX Lab"
          layout="fill"
          objectFit="cover"
          priority
        />
        <div className="absolute top-4 left-4 text-white font-bold text-lg flex items-center">
          <span role="img" aria-label="school" className="text-2xl mr-2">🏫</span> CSULB
        </div>
      </div>

      {/* Right Side - Form + Info */}
      <div className="w-1/2 flex flex-col items-center justify-center bg-white p-12">
        <h1 className="text-2xl font-bold">CPX LAB</h1>
        <p className="text-gray-600 text-center mt-2">
          Focusing on ensuring the safety and <br />
          reliability of cyber-physical systems
        </p>

        {/* Sign In Button (links to /register) */}
        <Link href="/register">
          <button className="mt-6 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-6 rounded shadow">
            Sign in with Single Sign-On
          </button>
        </Link>

        <p className="text-xs text-gray-500 mt-4">
          By signing in, you agree to our <a href="#" className="underline text-blue-600">Terms of Service</a> and <a href="#" className="underline text-blue-600">Privacy Policy</a>
        </p>

        <footer className="mt-16 text-xs text-gray-500">
          © 2024 California State University Long Beach
        </footer>
      </div>
    </div>
  );
}
