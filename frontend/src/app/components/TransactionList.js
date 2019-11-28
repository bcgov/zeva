import React, {useEffect, useState} from 'react';
import {Link} from "react-router-dom";
import {hot} from "react-hot-loader";
import CONFIG from "../config";
import {TransactionListClient} from '../../generated/transactions.protos_grpc_web_pb';
import {TransactionListRequest, TransactionType} from '../../generated/transactions.protos_pb';
import {withKeycloak} from "react-keycloak";

const TransactionList = (props) => {

  const [transactions, setTransactions] = useState([]);
  const typeName = (type) => {
    switch (type) {
      case TransactionType.BOUGHT:
        return 'Bought';
      case TransactionType.SOLD:
        return 'Sold';
      case TransactionType.VALIDATION:
        return 'Validation';
      case TransactionType.REDUCTION:
        return 'Reduction';
      default:
        return 'Unknown';
    }
  };

  const refreshTransactions = () => {
    props.keycloak.updateToken(30).then(
      () => {
    const client = new TransactionListClient('http://localhost:10000/grpc');

    const request = new TransactionListRequest();

    console.log(props.keycloak.token);
    console.dir(props.keycloak);

    const md = {
      'authorization': props.keycloak.idToken // || token for auth token
    };

    const call = client.getTransactions(request, md);

    let downloaded = [];

    call.on('data', s => {
      downloaded.push({
        id: s.getId(),
        amount: s.getAmount().getCents() / 100,
        credits: s.getCredits().getCredits(),
        type: typeName(s.getType())
      });
      console.log(s.getAmount().getCents());
    });
    call.on('status', s => {
      console.log(s);
    });
    call.on('error', r => {
      console.error(r);
    });
    call.on('end', () => {
      console.log('update complete');
      setTransactions(downloaded);
    });
      }).catch(e => {
      console.error('error refreshing token');
    })
  };

  useEffect(() => {
    refreshTransactions();
  }, [props.keycloak.authenticated]);


  return (
    <>
      <h1>Transaction List</h1>
      <div>
        <table>
          <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Credit Amount</th>
          </tr>
          </thead>
          <tbody>
          {
            transactions.map(t => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>{t.type}</td>
                <td>{t.amount}</td>
                <td>{t.credits}</td>
              </tr>
            ))
          }
          </tbody>
        </table>
        <hr/>
        {props.keycloak.authenticated && <button onClick={() => refreshTransactions()}>Refresh Transactions</button>}
      </div>
    </>
  );
};

export default hot(module)(withKeycloak(TransactionList));
