import { SiTwitter, SiGithub, SiInstagram } from "react-icons/si";
import { FiLinkedin } from "react-icons/fi";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="absolute -bottom-0 w-full">
      <div className="bg-indigo-600 dark:bg-indigo-900">
        <div className="container mx-auto flex flex-wrap px-5 py-4 sm:flex-row">
          <p className="text-center text-sm text-gray-50 sm:text-left">
            © {year} Bits-Of-C0de —{" "}
            <a href="https://twitter.com/soumyajit4419" rel="noopener noreferrer" className="ml-1 text-gray-50" target="_blank">
              @Soumyajit
            </a>
          </p>
          <span className="mt-2 inline-flex justify-center sm:ml-auto sm:mt-0 sm:justify-start">
            <a className="text-gray-50" href="https://twitter.com/soumyajit4419" target="_blank" rel="noreferrer"><SiTwitter /></a>
            <a className="ml-4 text-gray-50" href="https://github.com/soumyajit4419" target="_blank" rel="noreferrer"><SiGithub /></a>
            <a className="ml-4 text-gray-50" href="https://www.instagram.com/soumyajit4419/" target="_blank" rel="noreferrer"><SiInstagram /></a>
            <a className="ml-4 text-gray-50" href="https://www.linkedin.com/in/soumyajit4419/" target="_blank" rel="noreferrer"><FiLinkedin /></a>
          </span>
        </div>
      </div>
    </footer>
  );
}
