"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import Loading from "@/app/loading"; // Importing the Loading component

/**
 * SubnetPage component.
 * Displays a list of available IP addresses.
 * @returns {JSX.Element} The SubnetPage component.
 */
const SubnetPage = () => {
  const [availableIps, setAvailableIps] = useState<Map<string, string[]>>(
    new Map()
  );
  const [nonavailableIps, setNonavailableIps] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * Array of gateway information.
   * @type {Array<{ ip: string, range: number }> }
   */
  const gateways = JSON.parse(process.env.NEXT_PUBLIC_GATEWAYS || "[]");

  /**
   * Fetch non-available IP addresses.
   * @async
   * @function fetchData
   */
  useEffect(() => {
    document.title = "SEG IP Management";
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/units");
        const ipAddresses: string[] = response.data.map(
          (unit: { ip: string }) => unit.ip
        );
        setNonavailableIps(ipAddresses);
      } catch (error) {
        console.error("Error fetching units:", error); // Log any error encountered during data fetching
      }
    };
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Generates all IPs in the subnet and checks their availability.
   * @async
   * @function checkIps
   */
  useEffect(() => {
    setLoading(true);
    const checkIps = async () => {
      const availableIpsMap: Map<string, string[]> = new Map();

      for (const gateway of gateways) {
        const baseIp = gateway.ip.split(".").slice(0, 3).join(".");
        const availableIpsList: string[] = [];

        for (let i = 1; i <= gateway.range; i++) {
          const ip = `${baseIp}.${i}`;

          // Exclude non-available IPs
          if (!nonavailableIps.includes(ip)) {
            availableIpsList.push(i.toString().padStart(3, "0"));
          }
        }

        availableIpsMap.set(gateway.ip, availableIpsList);
      }

      setAvailableIps(availableIpsMap);
      setLoading(false);
    };

    checkIps();
  }, [nonavailableIps]); // This effect depends on `nonavailableIps`

  /**
   * Copies the given IP to the clipboard.
   * @param {string} gatewayIp The gateway IP address.
   * @param {string} lastOctet The last octet of the IP address.
   */
  const handleCopy = (gatewayIp: string, lastOctet: string) => {
    // Convert lastOctet to a number to remove leading zeros
    const ip = `${gatewayIp.split(".").slice(0, 3).join(".")}.${Number(
      lastOctet
    )}`;
    navigator.clipboard.writeText(ip).then(
      () => {
        alert(`${ip} has been copied to the clipboard.`);
      },
      (err) => {
        console.error("Failed to copy IP:", err);
      }
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-6">Available IP List</h1>
      {loading ? (
        <Loading />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {gateways.map((gateway: { ip: string; range: number }) => (
            <div key={gateway.ip} className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-center mb-4 sticky top-0 bg-white z-10">
                {gateway.ip}
              </h2>
              <div className="flex flex-col items-center w-full gap-1">
                {availableIps.get(gateway.ip)?.map((lastOctet) => (
                  <div
                    key={lastOctet}
                    className="w-full p-2 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-100"
                    onClick={() => handleCopy(gateway.ip, lastOctet)} // Handle copy on click
                  >
                    <span className="block text-center text-sm font-semibold">
                      {lastOctet}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {/* Fixed 'Home' button at the bottom right */}
          <Link
            href="/"
            className="fixed bottom-4 right-4 w-24 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 text-center"
          >
            Home
          </Link>
        </div>
      )}
    </div>
  );
};

export default SubnetPage;
