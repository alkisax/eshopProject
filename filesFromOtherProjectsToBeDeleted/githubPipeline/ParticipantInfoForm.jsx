// Οταν πατηθεί το κουμπί buy me a coffe στο menu, πριν πάμε στο checkout συλλεγουμε πληροφορίες του participant μέσο μιας φορμας που στο submit μας κατευθήνει στο chekout
// στέλνει ολες τις πληροφορίες του participant ως parms στο checkout και απο εκεί στο backend. Αργοτερα κατάλαβα οτι αυτό είναι περιτό αλλα το αφησα εδω γιατί μπορεί να χρειαστεί

import { Table, Form, Button } from 'react-bootstrap'
import Checkout from './Checkout'
import {
  BrowserRouter as Router,
  useNavigate
} from 'react-router-dom'

const ParticipantInfoForm = ({ setNewParticipant }) => {

  const navigate = useNavigate()

  const handleSubmitParticipant = async (event) => {
    const name = event.target.name.value
    const surname = event.target.surname.value
    const email = event.target.email.value

    if (!email) {
      alert('please enter your email')
    }

    setNewParticipant({
      name: name,
      surname: surname,
      email: email
    })

    // Create a query string from the newParticipant object
    const params = new URLSearchParams({
      name: name,
      surname: surname,
      email: email,
    }).toString()

    navigate(`/checkout?${params}`)
  }

  return (
    <>
      <div>
        <h2>Participant info</h2>
        <Form onSubmit={handleSubmitParticipant}>
          <Form.Group>
            <Form.Label>name:</Form.Label>
            <Form.Control
              type="text"
              name="name"
              placeholder="First Name"
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>surname:</Form.Label>
            <Form.Control
              type="text"
              name="surname"
              placeholder="Last Name"
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>email:</Form.Label>
            <Form.Control
              type="email"
              name="email"
              placeholder="email"
              required 
            />
          </Form.Group>
          <Button className='mt-3' variant="primary" type="submit">
            procced to checkout
          </Button>
        </Form>
      </div>
    </>
  )
}

export default ParticipantInfoForm