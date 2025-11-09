import api from "./api";

export const applyLoan = async (payload: any) => {
  const { data } = await api.post("/loans/apply", payload);
  return data;
};

export const getLoans = async () => {
  const { data } = await api.get("/loans");
  return data;
};

export const getLoanDetails = async (id: number) => {
  const { data } = await api.get(`/loans/${id}`);
  return data;
};
