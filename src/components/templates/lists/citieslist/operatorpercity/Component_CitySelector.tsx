'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';

interface CitySelectorProps {
  states: string[];
}

interface City {
  city: string;
  operator: string;
  checked: boolean;
}

export default function CitySelector({ states }: CitySelectorProps) {
  const { control, watch } = useForm();
  const selectedState = watch('state');
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCities() {
      if (selectedState) {
        try {
          const response = await fetch(`/api/stats/relative/listCities/listcityselector?state=${selectedState}`);
          if (!response.ok) {
            setError(`Erro ao buscar cidades: ${response.statusText}`);
            setCities([]);
            return;
          }

          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            setError('Resposta da API não é JSON.');
            setCities([]);
            return;
          }

          const data: City[] = await response.json();
          setCities(data.map(city => ({ ...city, checked: false })));
          setError(null);
        } catch (err) {
          setError(`Erro ao buscar cidades: ${(err as Error).message}`);
          setCities([]);
        }
      } else {
        setCities([]);
        setError(null);
      }
    }
    fetchCities();
  }, [selectedState]);

  const handleCheckboxChange = (index: number) => {
    setCities(prevCities => {
      const newCities = [...prevCities];
      newCities[index].checked = !newCities[index].checked;
      return newCities;
    });
  };

  return (
    <div>
      <Controller
        name="state"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <select {...field}>
            <option value="">Selecione um estado: </option>
            {states.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        )}
      />

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {cities.length > 0 && (
        <ul>
          {cities.map((city, index) => (
            <li key={city.city}>
              <label>
                <input
                  type="checkbox"
                  checked={city.checked}
                  onChange={() => handleCheckboxChange(index)}
                />
                {city.city} ({city.operator})
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}