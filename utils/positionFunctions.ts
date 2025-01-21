import { addDoc, query, DocumentData, onSnapshot, collection, serverTimestamp, where, doc, deleteDoc, orderBy } from "firebase/firestore";
import { initializeFirebase, getUserAuth, getFireStore } from "./databaseFunctions";

export const getOrgPositions = (
  oid: string,
  onUpdate: (positions: DocumentData[]) => void
) => {
  const app = initializeFirebase();
  const firestore = getFireStore(true);

  const q = query(
    collection(firestore, `/positions`),
    where("oid", "==", oid)
  );

  return onSnapshot(q, (querySnapshot) => {
    const positions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    onUpdate(positions);
  });
};

export const getAllPositions = (onUpdate: (positions: DocumentData[]) => void) => {
  const app = initializeFirebase();
  const firestore = getFireStore(true);

  const q = query(
    collection(firestore, `/positions`),
    orderBy("createdAt")
  );

  return onSnapshot(q, (querySnapshot) => {
    const positions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    onUpdate(positions);
  });
};

export const addPosition = async (positionData: {[key:string]: any}) => {
  const app = initializeFirebase();
  const auth = getUserAuth(true);
  const firestore = getFireStore(true);

  if (!auth.currentUser) {
    throw new Error("No authenticated user found");
  }

  try {
    const { uid } = auth.currentUser;
    await addDoc(collection(firestore, "positions"), {
      oid: uid,
      ...positionData,
      createdAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error creating position:", error);
    throw error;
  }
};

export const deletePosition = async (pid: string) => {
  const app = initializeFirebase();
  const auth = getUserAuth(true);
  const firestore = getFireStore(true);
  
  if (!auth.currentUser) {
    throw new Error("No authenticated user found");
  }

  try {
    const positionRef = doc(firestore, "positions", pid);
    await deleteDoc(positionRef);
    return true;
  } catch (error) {
    console.error("Error deleting position:", error);
    throw error;
  }
};

export const getApplicants = (
  pid: string,
  onUpdate: (applications: DocumentData[]) => void
) => {
  const app = initializeFirebase();
  const firestore = getFireStore(true);

  const q = query(
    collection(firestore, `/applications`),
    where("pid", "==", pid)
  );

  return onSnapshot(q, (querySnapshot) => {
    const applications = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    onUpdate(applications);
  });
};