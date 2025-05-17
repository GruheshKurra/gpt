import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-xl mb-6">Page not found</p>
      <Button onClick={() => navigate("/")}>Return Home</Button>
    </div>
  );
};

export default NotFound; 