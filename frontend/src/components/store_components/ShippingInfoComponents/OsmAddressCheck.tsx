// frontend/src/components/store_components/ShippingInfoComponents/OsmAddressCheck.tsx
import { Box, Button, Stack, Typography } from '@mui/material';
import { useMemo, useState } from 'react';

type Props = {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;

  // προαιρετικά UI props
  height?: number;
};

type NominatimResult = {
  lat: string;
  lon: string;
  display_name?: string;
};

const buildQuery = (p: Props) => {
  // Σφιχτό format για καλύτερο geocoding:
  // street+number, postal, city, country
  const parts = [
    p.addressLine1,
    p.addressLine2,
    p.postalCode,
    p.city,
    p.country,
  ]
    .map((x) => (x || '').trim())
    .filter(Boolean);

  return parts.join(', ');
};

const isNominatimResultArray = (x: unknown): x is NominatimResult[] => {
  if (!Array.isArray(x)) return false;
  return x.every((it) => {
    if (!it || typeof it !== 'object') return false;
    const rec = it as Record<string, unknown>;
    return typeof rec.lat === 'string' && typeof rec.lon === 'string';
  });
};

const makeBbox = (lat: number, lon: number, delta = 0.005) => {
  // bbox order in OSM embed:
  // minLon,minLat,maxLon,maxLat
  const minLat = lat - delta;
  const maxLat = lat + delta;
  const minLon = lon - delta;
  const maxLon = lon + delta;

  return `${minLon},${minLat},${maxLon},${maxLat}`;
};

const OsmAddressCheck = ({
  addressLine1,
  addressLine2,
  city,
  postalCode,
  country,
  height = 320,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [lastCheckedAt, setLastCheckedAt] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [mapSrc, setMapSrc] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');

  const query = useMemo(() => {
    return buildQuery({ addressLine1, addressLine2, city, postalCode, country });
  }, [addressLine1, addressLine2, city, postalCode, country]);

  const canCheck = query.length >= 6;

  const handleCheck = async () => {
    setError('');
    setDisplayName('');

    if (!canCheck) {
      setError('Συμπλήρωσε πρώτα διεύθυνση/πόλη.');
      return;
    }

    // Μικρό throttle (1 request/sec) για να μην σπαμάρει ο χρήστης το API
    const now = Date.now();
    if (now - lastCheckedAt < 1100) {
      setError('Περίμενε 1 δευτερόλεπτο και ξαναδοκίμασε.');
      return;
    }

    setLastCheckedAt(now);
    setLoading(true);

    try {
      // Nominatim Search (free geocoding)
      // Σημείωση: Browser στέλνει φυσικό Referer από το site σου.
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&addressdetails=0&q=${encodeURIComponent(
        query
      )}`;

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          // Δεν μπορούμε να αλλάξουμε User-Agent στον browser,
          // αλλά βάζουμε ένα Accept και βασιζόμαστε στον Referer.
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        setError(`Geocoding error: ${res.status}`);
        setLoading(false);
        return;
      }

      const data: unknown = await res.json();

      if (!isNominatimResultArray(data) || data.length === 0) {
        setError('Δεν βρέθηκε αποτέλεσμα. Δοκίμασε να βάλεις και αριθμό οδού.');
        setLoading(false);
        return;
      }

      const first = data[0];
      const lat = Number(first.lat);
      const lon = Number(first.lon);

      if (Number.isNaN(lat) || Number.isNaN(lon)) {
        setError('Μη έγκυρο αποτέλεσμα γεωκωδικοποίησης.');
        setLoading(false);
        return;
      }

      setDisplayName(first.display_name || '');

      // OSM embed with marker
      const bbox = makeBbox(lat, lon, 0.006);
      const embed = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
        bbox
      )}&layer=mapnik&marker=${encodeURIComponent(`${lat},${lon}`)}`;

      setMapSrc(embed);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Άγνωστο σφάλμα.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={1.5}>
      <Stack direction='row' spacing={2} alignItems='center'>
        <Button
          variant='outlined'
          onClick={handleCheck}
          disabled={!canCheck || loading}
        >
          {loading ? 'Έλεγχος...' : 'Έλεγχος στον χάρτη'}
        </Button>

        {!canCheck && (
          <Typography variant='caption' color='text.secondary'>
            Συμπλήρωσε τουλάχιστον διεύθυνση και πόλη.
          </Typography>
        )}
      </Stack>

      {!!error && (
        <Typography variant='caption' color='error'>
          {error}
        </Typography>
      )}

      {!!displayName && (
        <Typography variant='caption' color='text.secondary'>
          Βρέθηκε: {displayName}
        </Typography>
      )}

      {!!mapSrc && (
        <>
          <Box
            component='iframe'
            src={mapSrc}
            sx={{
              width: '100%',
              height,
              border: 0,
              borderRadius: 2,
              overflow: 'hidden',
            }}
            loading='lazy'
            referrerPolicy='no-referrer-when-downgrade'
            // OSM embed δουλεύει χωρίς allow-scripts σε αρκετούς browsers,
            // αλλά αν δεις grey box σε κάποιο περιβάλλον, πες μου να το ρυθμίσουμε.
          />

          <Typography variant='caption' color='text.secondary'>
            © OpenStreetMap contributors
          </Typography>
        </>
      )}
    </Stack>
  );
};

export default OsmAddressCheck;
