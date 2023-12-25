import { lazy } from 'react';
import streetLogo from '../../assets/street_logo.jpeg';

const TemplatePointers = lazy(() => import('./components/TemplatePointers'));

const LandingIntro = () => {
  return (
    <div className="hero min-h-full rounded-l-xl bg-base-200">
      <div className="hero-content py-12">
        <div className="max-w-md">
          <h1 className="text-3xl text-center font-bold ">
            <img
              src={streetLogo}
              className="w-12 inline-block mr-2 mask mask-circle"
              alt="dashwind-logo"
            />
            Street Côte d'Ivoire
          </h1>

          <div className="text-center mt-12">
            <img
              src="./intro.png"
              alt="Dashwind Admin Template"
              className="w-48 inline-block"
            ></img>
          </div>

          {/* Importing pointers component */}
          <TemplatePointers />
        </div>
      </div>
    </div>
  );
};

export default LandingIntro;
