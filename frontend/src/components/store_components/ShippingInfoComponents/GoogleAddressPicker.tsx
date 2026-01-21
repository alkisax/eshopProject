// στην πορεία ανακάληψα οτι η google maps μπορεί να το χρεώνει αυτό και προς το παρόν αυτό το αρχείο θα παραμείνει εδώ για legacy λογους χωρίς να καλείτε κάπου και είναι οπως το έδωσε το chatgppt χωρίς έλεγχο απο εμένα
'use client';

import { Box, TextField, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { importLibrary, setOptions } from '@googlemaps/js-api-loader';

type ResolvedAddress = {
  formattedAddress?: string;
  addressLine1: string;
  city: string;
  postalCode: string;
  country: string;
  lat?: number;
  lng?: number;
};

type GoogleAddressPickerProps = {
  apiKey: string;
  label?: string;
  value: string;
  onValueChange: (next: string) => void;
  onResolved: (addr: ResolvedAddress) => void;
  heightPx?: number;
};

const DEFAULT_CENTER: google.maps.LatLngLiteral = { lat: 37.98381, lng: 23.727539 }; // Αθήνα

const getComponent = (
  comps: google.maps.GeocoderAddressComponent[] | undefined,
  type: string
) => comps?.find((c) => c.types.includes(type))?.long_name ?? '';

const GoogleAddressPicker = ({
  apiKey,
  label = 'Διεύθυνση',
  value,
  onValueChange,
  onResolved,
  heightPx = 260,
}: GoogleAddressPickerProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);

  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        setOptions({ key: apiKey, v: 'weekly' });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [{ Map }, _placesLib, _markerLib] = await Promise.all([
          importLibrary('maps') as Promise<google.maps.MapsLibrary>,
          importLibrary('places') as Promise<google.maps.PlacesLibrary>,
          importLibrary('marker') as Promise<google.maps.MarkerLibrary>,
        ]);

        if (cancelled) return;

        const inputEl = inputRef.current;
        const mapEl = mapRef.current;

        if (!inputEl || !mapEl) {
          setLoadError('Δεν βρέθηκαν refs για input/map.');
          return;
        }

        const map = new Map(mapEl, {
          center: DEFAULT_CENTER,
          zoom: 13,
          disableDefaultUI: true,
          zoomControl: true,
        });

        // Legacy marker (πιο απλό, δεν απαιτεί mapId)
        const marker = new google.maps.Marker({
          map,
          position: DEFAULT_CENTER,
        });

        const autocomplete = new google.maps.places.Autocomplete(inputEl, {
          fields: ['address_components', 'formatted_address', 'geometry'],
          types: ['address'],
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();

          const loc = place.geometry?.location;
          const lat = loc?.lat();
          const lng = loc?.lng();

          if (lat != null && lng != null) {
            map.setCenter({ lat, lng });
            map.setZoom(17);
            marker.setPosition({ lat, lng });
          }

          const comps = place.address_components;

          const streetNumber = getComponent(comps, 'street_number');
          const route = getComponent(comps, 'route');
          const addressLine1 = [route, streetNumber].filter(Boolean).join(' ').trim();

          // Σε κάποιες χώρες μπορεί να έρθει ως postal_town αντί locality
          const city =
            getComponent(comps, 'locality') ||
            getComponent(comps, 'postal_town') ||
            getComponent(comps, 'administrative_area_level_2');

          const postalCode = getComponent(comps, 'postal_code');
          const country = getComponent(comps, 'country');

          const formattedAddress = place.formatted_address ?? undefined;

          // ενημερώνουμε και το input value (ώστε να φαίνεται αυτό που διάλεξε)
          if (formattedAddress) {
            onValueChange(formattedAddress);
          }

          onResolved({
            formattedAddress,
            addressLine1: addressLine1 || (formattedAddress ?? ''),
            city: city || '',
            postalCode: postalCode || '',
            country: country || '',
            lat,
            lng,
          });
        });
      } catch (err) {
        console.log(err);
        
        setLoadError('Αποτυχία φόρτωσης Google Maps. Έλεγξε API key / billing / restrictions.');
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [apiKey, onResolved, onValueChange]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <TextField
        inputRef={inputRef}
        label={label}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder='Πληκτρολόγησε διεύθυνση και διάλεξε από τη λίστα'
        fullWidth
      />

      <Box
        ref={mapRef}
        sx={{
          width: '100%',
          height: `${heightPx}px`,
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
        }}
      />

      {loadError && (
        <Typography variant='caption' color='error'>
          {loadError}
        </Typography>
      )}
    </Box>
  );
};

export default GoogleAddressPicker;
