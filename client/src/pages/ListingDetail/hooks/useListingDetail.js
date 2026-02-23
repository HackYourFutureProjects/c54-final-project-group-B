import { useState, useEffect } from "react";
import useFetch from "../../../hooks/useFetch";

export const useListingDetail = (id) => {
  const [listing, setListing] = useState(null);

  const {
    isLoading: loading,
    error,
    performFetch,
    cancelFetch,
  } = useFetch(`/listings/${id}`, (response) => {
    setListing(response.result);
  });

  useEffect(() => {
    performFetch();
    return () => cancelFetch();
  }, [id, performFetch, cancelFetch]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/listings/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const data = await res.json();
        setListing((prev) => ({ ...prev, status: data.listing.status }));
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating status");
    }
  };

  return { listing, loading, error, handleStatusUpdate };
};
