// αυτό είναι ένα συμαντικό component. Μου δείχνει τι τραπεζικές συναλαγές έχουν γίνει και αν αυτές έχουν επεξεργαστεί. Με ένα κουμπι κάνω toggle την επεξεργασία τους. Στο backend η επεξεργασία του transaction αυτομάτος κάνει trigger την αποστολή email με nodemailer

import axios from 'axios'
import { useState, useEffect } from 'react'
import { Table, Button } from 'react-bootstrap'


const Transactions =  ({ url }) => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  // μου επιστρέφει τη λίστα με τισ συναλλαγές για να τα προβάλει
  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get(`${url}/transaction`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setTransactions(response.data.data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching transactions:", error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  const toggleShowAll = () => {
    setShowAll(!showAll)
  }

  // κάνει toggle το αν έχει επεξεργαστεί η συναλλαγή. Κάνει trigger το thnx email
  const markProcessed = async (transactionId) => {
    try {
      const token = localStorage.getItem("token")
      console.log("token: ", token);
      
      const response = await axios.put(`${url}/transaction/toggle/${transactionId}`,
        {}, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      const isProcessed = response.data.data.processed
      console.log("transaction is processed?",isProcessed);
      
      setTransactions(response.data.data)
      fetchTransactions()
    } catch (error) {
      console.error("Error fetching transactions:", error)
    }
  }


  return (
    <>
      {loading && <p>Loading...</p>}
      
      {!loading && transactions.length === 0 && <p>No transactions found</p>}

      <Button variant="info" onClick={toggleShowAll} className="mb-3">
        {showAll ? "Show only unprocessed" : "Show all"}
      </Button>

      {!loading && Array.isArray(transactions) && transactions.length !== 0 && (
        <div className="table-responsive">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th className="d-none d-sm-table-cell">Name</th>
                <th className="d-none d-sm-table-cell">Surname</th>
                <th className="d-none d-sm-table-cell">Amount (€)</th>
                <th>Email</th>
                <th>Status</th>
                <th className="d-none d-sm-table-cell">Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions
              // με φιλτερ γινεται το show all
                .filter(t => showAll || !t.processed)
                .map((transaction) => {
                  const participant = transaction.participant
                  return (
                    <tr key={transaction._id}>
                      <td className="d-none d-sm-table-cell">{participant?.name || 'No Name'}</td>
                      <td className="d-none d-sm-table-cell">{participant?.surname || 'No Surname'}</td>
                      <td className="d-none d-sm-table-cell">€{transaction.amount}</td>
                      <td>{participant?.email || 'No Email'}</td>
                      <td>{transaction.processed ? 'Processed' : 'Unprocessed'}</td>
                      <td className="d-none d-sm-table-cell">{new Date(transaction.createdAt).toLocaleString()}</td>
                      <td>
                        <Button
                          variant={transaction.processed ? 'warning' : 'success'}
                          onClick={() => markProcessed(transaction._id)}
                        >
                          {transaction.processed ? 'Mark Unprocessed' : 'Send email & Mark Processed'}
                        </Button>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </Table>
        </div>
      )}
    </>
  )
}

export default Transactions