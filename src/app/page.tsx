import Authentication from "@/auth";

const page = () => {
  return (
    <div className="flex justify-center items-center w-full min-h-screen">
      <Authentication />
    </div>
  );
};

export default page;
