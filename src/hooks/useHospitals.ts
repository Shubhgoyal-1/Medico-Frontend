import { useEffect, useState } from "react";
import axios from "axios";

interface Hospital {
  _id: string;
  name: string;
  address:string;
  phone:string;
  pincode:string;
  state: string;
  city: string;
}
import { API } from "@/config/api";

export function useHospitals(state: string, city: string) {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!state || !city) return;

    const fetchHospitals = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API}/hospital/getHospitalsByStateAndCity`, {
          params: { state, city },
        });
        console.log(res)
        setHospitals(res.data.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch hospitals");
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, [state, city]);

  return { hospitals, loading, error };
}
