import { type FormEvent } from "react";
import { useRevalidator } from "react-router";
import useInput from "../../hooks/useInput";
import usePostForm from "../../hooks/usePostForm";
import Button from "../Button";
import Input from "../Input";
import Modal from "../Modal";

export default function AddFriend({ onClose }: { onClose: () => void }) {
  const [email, handleEmail] = useInput("");
  const { revalidate } = useRevalidator();
  const { submit, loading, error } = usePostForm<{ emailAddress: string }, { message: string }>("/social/friends", {
    onSuccess: async () => {
      onClose();
      await revalidate();
    },
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submit({ emailAddress: email });
  }

  return (
    <Modal title="Add Friend" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email">Email</label>
          <Input type="email" id="email" value={email} onChange={handleEmail} placeholder="example@gmail.com" />
        </div>
        {error && <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error.message}</p>}
        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Add Friend"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
