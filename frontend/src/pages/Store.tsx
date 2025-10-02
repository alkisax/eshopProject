import { Helmet } from 'react-helmet-async'
import StoreItemList from '../components/store_components/StoreItemList'

const Store = () => {
  // const { url } = useContext(VariablesContext)  

  return (
    <>
      <Helmet>
        <title>Κατάστημα | Έχω μια Ιδέα</title>
        <meta
          name="description"
          content="Ανακαλύψτε τη συλλογή χειροποίητων κοσμημάτων μας. Δαχτυλίδια, σκουλαρίκια και μοναδικές δημιουργίες φτιαγμένες με αγάπη."
        />
        <link rel="canonical" href={window.location.origin + "/store"} />
      </Helmet>
      
      <br />
      <StoreItemList />
    </>
  )
}
export default Store