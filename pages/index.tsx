import { ArrowRightIcon } from "@heroicons/react/24/solid";
import Button from "../components/Button";
import FestivitiesIllustration from "../components/icons/illustrations/FestivitiesIllustration";
import AuthenticationIllustration from "../components/icons/illustrations/AuthenticationIllustration";
import { signIn, useSession } from "next-auth/react";

const Home = () => {
  const { data: session } = useSession();
  const handleLogin = () => signIn("auth0");

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-5 px-5">
        <AuthenticationIllustration className="h-52" />
        <p className="text-lg flex text-center">
          Vennligst logg inn for å få tilgang til opptakssystemet
        </p>
        <div className="flex md:hidden w-full items-center justify-center">
          <Button title={"Logg inn"} color={"blue"} onClick={handleLogin} />
        </div>
      </div>
    );
  }

  return (
    <section className="flex items-center justify-center h-full bg-white dark:bg-gray-900">
      <div className="grid max-w-screen-xl px-4 py-8 mx-auto lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12">
        <div className="mr-auto place-self-center lg:col-span-7">
          <h1 className="max-w-2xl mb-4 text-4xl font-bold leading-none tracking-tight md:text-5xl xl:text-6xl dark:text-white">
            opptak.online
          </h1>
          <p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl dark:text-gray-400">
            Her skal det stå masse kult om komitéopptak og sånn og om at man må
            bli med i komité og at dette er det bra opptakssystem og sånn.
          </p>
          <div className="flex gap-4">
            <Button
              title="Søk nå"
              color="blue"
              icon={<ArrowRightIcon className="w-4 h-4" />}
              href="/apply"
            />
            <Button title="Om opptak" color="white" href="/about" />
          </div>
        </div>
        <div className="hidden lg:mt-0 lg:col-span-5 lg:flex">
          <FestivitiesIllustration className={""} />
        </div>
      </div>
    </section>
  );
};
export default Home;
