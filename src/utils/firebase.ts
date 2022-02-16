import { initializeApp } from 'firebase/app';
import { getDatabase, ref, child, get, set, update, push, remove } from "firebase/database";
import 'firebase/storage';
import { objectToArray } from 'src/helpers/object';
import { baseJars } from 'src/common';
import { JARSPERCENT } from 'src/constant/common';

const firebaseConfig = {
  apiKey: "AIzaSyCyrN_eQOWc1rIAJKu2ZaSRHXnz9Btvxzs",
  authDomain: "test-92ca3.firebaseapp.com",
  databaseURL: "https://test-92ca3-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "test-92ca3",
  storageBucket: "test-92ca3.appspot.com",
  messagingSenderId: "180006957405",
  appId: "1:180006957405:web:6bdce874bb910b180838b4"
};


const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const jars = baseJars();
const usersModel = ref(db, 'users');
const transactionsModel = ref(db, 'transactions')

// Users Methods
export function getUsers() {
  return get(usersModel)
    .then((snapshot) => {
      return objectToArray(snapshot.val())
    })
    .catch((err) => alert(err));
}

export function getUser(_id) {
  return get(child(usersModel, `/${_id}`))
    .then((snapshot) => snapshot.val())
    .catch((err) => alert(err));
}

export function newUser(data) {
  const display_name = data.username;
  const balance = { percent: JARSPERCENT, income: jars, expense: jars };

  const newPostKey = push(child(ref(db), 'users')).key;
  const updates = {}
  updates['/users/' + newPostKey] = {
    ...data, display_name, balance, _id: newPostKey
  };
  return update(ref(db), updates)
    .then(() => {
      return true
    })
    .catch((err) => {
      alert(err)
      return false
    });
}

export async function updateUser(_id, update) {
  const user = await getUser(_id)
  const dataUpdate = { ...user, ...update };
  return set(ref(db, 'users/' + _id), dataUpdate)
    .then(() => {
      return dataUpdate
    })

}

export function getTransactions(user) {
  return get(child(transactionsModel, user))
    .then((snapshot) => {
      const transactions = snapshot.val();
      const newTransactions = [];
      for (const key in transactions) {
        if (transactions.hasOwnProperty(key))
          newTransactions.push({
            ...transactions[key],
          });
      }
      return newTransactions;
    })
    .catch((err) => alert(err));
}

export function newTransaction(user, data) {
  const newPostKey = push(child(transactionsModel, user)).key;
  const postData = {
    ...data,
    _id: newPostKey
  }
  const updates = {};
  updates[newPostKey] = postData

  return update(ref(db, 'transactions/' + user), updates)
    .then(() => {
      return postData
    })
}

export function getTransaction(user, _id) {
  return get(child(child(transactionsModel, user), _id)).then((snapshot) => {
    return snapshot.val()
  })
}

export async function updateTransaction(user, _id, update) {
  const transaction = await getTransaction(user, _id)
  const dataUpdate = { ...transaction, ...update };

  return set(ref(db, 'transactions/' + user + '/' + _id), dataUpdate)
    .then(() => {
      return dataUpdate
    })
}

export function deleteTransaction(user, _id) {
  const transaction = getTransaction(user, _id)
  remove(child(child(transactionsModel, user), _id))
  return transaction
}
