
import { Box, Typography } from "@mui/material";
import CartItemsList from "../components/store_components/CartItemsList"
import { Helmet } from "react-helmet-async";

const Cart = () => {
  // const { url } = useContext(VariablesContext)  

  return (
    <>
        <Helmet>
          <title>Καλάθι Αγορών | Έχω μια Ιδέα</title>
          <meta
            name="description"
            content="Δείτε τα προϊόντα που έχετε προσθέσει στο καλάθι σας και προχωρήστε στην αποστολή για να ολοκληρώσετε την αγορά."
          />
          <link
            rel="canonical"
            href={window.location.origin + window.location.pathname}
          />
        </Helmet>

      <br />

      <Box sx={{ mt: 4, mb: 2, textAlign: "center" }}>
        <Typography
          variant="h4"
          component="h1"
          fontWeight="bold"
        >
          Καλάθι Αγορών
        </Typography>
      </Box>

      <CartItemsList />
    </>
  )
}
export default Cart