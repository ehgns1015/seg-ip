"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { apiService } from "@/app/services/api";
import Layout from "@/app/components/Layout";
import Loading from "@/app/loading";

/**
 * Interface for gateway information
 */
interface Gateway {
  ip: string;
  range: number;
}

/**
 * IP List page component.
 * Displays a list of available IP addresses organized by gateway.
 *
 * @returns {JSX.Element} The IP List page component
 */
const IPListPage = () => {
  const [usedIps, setUsedIps] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  // Get gateways from environment variables
  const gateways: Gateway[] = useMemo(() => {
    try {
      return JSON.parse(process.env.NEXT_PUBLIC_GATEWAYS || "[]");
    } catch (e) {
      console.log("Error parsing gateways:", e);
      return [];
    }
  }, []);

  /**
   * Fetch used IP addresses.
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const units = await apiService.getAllUnits();
        const ipAddresses: string[] = units
          .map((unit: { ip: string }) => unit.ip)
          .filter(Boolean);
        setUsedIps(ipAddresses);
      } catch (error) {
        console.log("Error fetching units:", error);
        setError("Failed to load IP data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /**
   * Generate available IPs for each gateway
   */
  const gatewayAvailableIps = useMemo(() => {
    const result = new Map<string, string[]>();

    gateways.forEach((gateway) => {
      const baseIp = gateway.ip.split(".").slice(0, 3).join(".");
      const availableIpsList: string[] = [];

      // Ensure the range only goes up to 254 (common networking practice)
      const maxRange = Math.min(gateway.range, 254);

      for (let i = 1; i <= maxRange; i++) {
        const ip = `${baseIp}.${i}`;

        // Add to available list if not in use
        if (!usedIps.includes(ip)) {
          availableIpsList.push(i.toString().padStart(3, "0"));
        }
      }

      result.set(gateway.ip, availableIpsList);
    });

    return result;
  }, [gateways, usedIps]);

  /**
   * Copies the given IP to the clipboard.
   */
  const handleCopy = useCallback((gatewayIp: string, lastOctet: string) => {
    // Convert lastOctet to a number to remove leading zeros
    const ip = `${gatewayIp.split(".").slice(0, 3).join(".")}.${Number(
      lastOctet
    )}`;

    navigator.clipboard.writeText(ip).then(
      () => {
        setCopyMessage(`${ip} copied to clipboard`);
        setTimeout(() => setCopyMessage(null), 2000);
      },
      (err) => {
        console.log("Failed to copy IP:", err);
        setCopyMessage("Failed to copy IP");
        setTimeout(() => setCopyMessage(null), 2000);
      }
    );
  }, []);

  return (
    <Layout title="Available IP Addresses">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold text-center mb-6">
          Available IP List
        </h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4 text-center">
            {error}
          </div>
        )}

        {copyMessage && (
          <div className="fixed top-4 right-4 bg-green-100 text-green-800 p-2 rounded shadow-md">
            {copyMessage}
          </div>
        )}

        {loading ? (
          <Loading />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {gateways.map((gateway) => {
              const availableIps = gatewayAvailableIps.get(gateway.ip) || [];

              return (
                <div
                  key={gateway.ip}
                  className="bg-white p-4 rounded-lg shadow-md"
                >
                  <h2 className="text-xl font-semibold text-center mb-4 sticky top-0 bg-white z-10">
                    {gateway.ip}
                  </h2>

                  {availableIps.length === 0 ? (
                    <p className="text-center text-gray-500">
                      No available IPs
                    </p>
                  ) : (
                    <div className="flex flex-col items-center w-full gap-1">
                      {availableIps.map((lastOctet) => (
                        <div
                          key={`${gateway.ip}-${lastOctet}`}
                          className="w-full p-2 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-100"
                          onClick={() => handleCopy(gateway.ip, lastOctet)}
                        >
                          <span className="block text-center text-sm font-semibold">
                            {lastOctet}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default IPListPage;
