import moment from 'moment';
import { useEffect } from 'react';
import cliTruncate from 'cli-truncate';

import TitleCard from '../../../components/Cards/TitleCard';

const UserDetailsBodyRightDrawer = ({ extraObject }) => {
  return (
    <>
      <TitleCard
        title={`ABOUT ${cliTruncate(extraObject?.nom_complet.toLocaleUpperCase(), 20)}`}
        topMargin="my-2"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="font-bold">Last Name</div>
          <div className="text-primary col-span-2">{extraObject.nom.toLocaleUpperCase()}</div>
          <div className="font-bold">First Name</div>
          <div className="text-primary col-span-2">{extraObject.prenom.toLocaleUpperCase()}</div>
          <div className="font-bold">Phone Number</div>
          <div className="text-primary col-span-2">{extraObject.telephone}</div>
          <div className="font-bold">e-Mail Address</div>
          <div className="text-primary col-span-2">{extraObject.email}</div>
          <div className="font-bold">Address</div>
          <div className="text-primary col-span-2">{extraObject.adresse.toLocaleUpperCase()}</div>
          <div className="font-bold">User Type</div>
          <div className="text-primary col-span-2">
            {extraObject?.user_type?.libelle?.toLocaleUpperCase()}
          </div>
          <div className="font-bold">Creation Date</div>
          <div className="text-primary col-span-2">
            {moment.utc(extraObject?.created_at).format('LL')}
          </div>
          <div className="font-bold">User Account Status</div>
          <div className="text-primary col-span-2">
            {extraObject?.is_locked ? (
              <div className="badge badge-sm badge-outline badge-error">Inactive</div>
            ) : (
              <div className="badge badge-outline badge-success">Active</div>
            )}
          </div>
        </div>
      </TitleCard>
      <TitleCard title={`ABOUT THE USER CREATION`} topMargin="my-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="font-bold">Creator Last Name</div>
          <div className="text-primary col-span-2">
            {extraObject?.UserCreate?.nom?.toLocaleUpperCase()}
          </div>
          <div className="font-bold">Creator First Name</div>
          <div className="text-primary col-span-2">
            {extraObject?.UserCreate?.prenom?.toLocaleUpperCase()}
          </div>
          <div className="font-bold">Creator Phone Number</div>
          <div className="text-primary col-span-2">{extraObject?.UserCreate?.telephone}</div>
          <div className="font-bold">Creator e-Mail Address</div>
          <div className="text-primary col-span-2">{extraObject?.UserCreate?.email}</div>
          <div className="font-bold">Adresse</div>
          <div className="text-primary col-span-2">{extraObject.adresse.toLocaleUpperCase()}</div>
        </div>
      </TitleCard>
    </>
  );
};

export default UserDetailsBodyRightDrawer;
