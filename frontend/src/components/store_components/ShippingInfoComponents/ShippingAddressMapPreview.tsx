// θα προτιμήσω προς το παρόν να χρησιμοποιήσω το component frontend\src\components\store_components\ShippingInfoComponents\OsmAddressCheck.tsx το οποίο χρησιμοποιεί open street view. Αυτό το αρχείο δεν καλήτε πουθενα και μένει εδώ για legacy λογους, είναι οπως το έδωσε το chatgpt χωρίς έλεγχο
// frontend/src/components/store_components/ShippingInfoComponents/ShippingAddressMapPreview.tsx
import { Box, Button, Stack, Typography } from '@mui/material';
import { useMemo, useState } from 'react';

type Props = {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
};

const buildQuery = (p: Props) => {
  // φτιάχνουμε ένα “λογικό” string διεύθυνσης
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

const ShippingAddressMapPreview = ({
  addressLine1,
  addressLine2,
  city,
  postalCode,
  country,
}: Props) => {
  const [show, setShow] = useState(false);

  const query = useMemo(() => {
    return buildQuery({ addressLine1, addressLine2, city, postalCode, country });
  }, [addressLine1, addressLine2, city, postalCode, country]);

  const canCheck = query.length >= 6;

  const iframeSrc = useMemo(() => {
    // Χωρίς key: χρησιμοποιούμε Google Maps search embed
    // Note: αυτό δείχνει “best effort” αποτέλεσμα, όχι guaranteed exact pin.
    const encoded = encodeURIComponent(query);
    return `https://www.google.com/maps?q=${encoded}&output=embed`;
  }, [query]);

  return (
    <Stack spacing={1.5}>
      <Stack direction='row' spacing={2} alignItems='center'>
        <Button
          variant='outlined'
          onClick={() => setShow(true)}
          disabled={!canCheck}
        >
          Έλεγχος στον χάρτη
        </Button>

        {!canCheck && (
          <Typography variant='caption' color='text.secondary'>
            Συμπλήρωσε πρώτα διεύθυνση/πόλη.
          </Typography>
        )}
      </Stack>

      {show && (
        <Box
          component='iframe'
          src={iframeSrc}
          sx={{
            mx: 'auto',
            display: 'block',
            width: '100%',
            height: 320,
            border: 0,
            borderRadius: 2,
          }}
          loading='lazy'
          allowFullScreen
          referrerPolicy='no-referrer-when-downgrade'
        />
      )}
    </Stack>
  );
};

export default ShippingAddressMapPreview;
