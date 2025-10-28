import React, { useEffect, useState } from "react";
import PgCard from "../../Components/Pg/PgCard";
import { getLoggedInUser } from "../../../Shared/Store/LoginAuthStore";
import { useNavigate } from "react-router-dom";
import { fetchPgs } from "../../../Shared/Store/PgAuthStore";
import { Pg as PgModel } from "../../../Shared/Models/Pg.model";
import Loading from "../../../Shared/Components/Loading";

const AllAvailablePg: React.FC = () => {
  const navigate = useNavigate();
  const [pgList, setPgList] = useState<PgModel[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkUserLoginAndFetchPgs = async () => {
      setLoading(true); // Start loading
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const register = await getLoggedInUser();
          console.log(register);

          try {
            setUserId(register._id);
            const allPgs = await fetchPgs();

            // Filter PGs that are verified
            const verifiedPgs = allPgs.filter((pg: PgModel) => pg.isVerified);

            setPgList(verifiedPgs);
          } catch {
            setError("Failed to load PGs. Please try again later.");
          } finally {
            setLoading(false);
          }
        } else {
          navigate("/login");
        }
      } catch (err) {
        console.error("Error fetching PGs:", err);
        setError("Failed to Authenticate. Please try again later.");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkUserLoginAndFetchPgs();
  }, [navigate]);

  if (loading) {
    return (
      <div>
        <Loading size={50} />
      </div>
    );
  }

  if (error) {
    return <div className="pt-24 text-center text-red-500 py-8">{error}</div>;
  }

  return (
    <div className="py-8">
      <div className="container mx-auto md:px-14 pt-6 md:pt-24 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pgList.length > 0 ? (
            pgList.map((pg, index) => (
              <PgCard
                key={pg._id || index}
                pgId={pg._id}
                userId={userId || ""}
                providerRegId={pg.reg_id}
                title={pg.name || "Unnamed PG"}
                location={`${pg.street}, ${pg.city}, ${pg.state}`}
                price={`₹${pg.price}/mo`}
                features={[]}
                occupancy={["Single", "Double", "Triple"]}
                gender={pg.pgtype[0].name}
                image={pg.image1 || ""}
                status={pg.isVerified ? "Verified" : "Not Verified"}
              />
            ))
          ) : (
            <div>No PGs available at the moment.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllAvailablePg;
