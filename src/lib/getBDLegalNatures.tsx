/*import prisma from "@/app/api/database/dbclient";
import { useState, useEffect } from "react";

export function useLegalNatures() {
  const [legalnatures, setLegalnatures] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const fetchLegalNatures = await prisma.legalnatures.findMany({
          select: {
            name: true,
          },
        });
        setLegalnatures(fetchLegalNatures.map(ln => ln.name));
      } catch (error) {
        console.error('Erro ao buscar naturezas jurídicas:', error);
      }
    }
    fetchData();
  }, []);

  return legalnatures;
};*/