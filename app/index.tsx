import { Header } from "~/app/components/widgets/header";
export function meta() {
  return [
    { title: "Open Fans Platform" },
    {
      name: "description",
      content: "Censorship-resistant, open-protocol content publishing engine",
    },
  ];
}

export default function Home() {
  return (
    <>
      <Header />
    </>
  );
}
