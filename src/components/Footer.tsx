import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-sm text-gray-600">
          <p>© {new Date().getFullYear()} Southern Savor Collective. All rights reserved.</p>
          <div className="flex gap-4">
            <Link 
              to="/privacy" 
              className="hover:text-[#FEC6A1] transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              to="/terms" 
              className="hover:text-[#FEC6A1] transition-colors"
            >
              Terms of Service
            </Link>
            <Link 
              to="/data-deletion" 
              className="hover:text-[#FEC6A1] transition-colors"
            >
              Data Deletion</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}