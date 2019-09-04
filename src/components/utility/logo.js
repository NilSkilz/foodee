import React from 'react';
import { Link } from 'react-router-dom';
import { siteConfig } from '../../settings';

export default ({ collapsed }) => {
  return (
    <div className='isoLogoWrapper'>
      {collapsed ? (
        <div>
          <h3>
            <Link to='/dashboard'>
              <img width='30%' src='/images/FoodeeFridge.png' alt='logo' />
            </Link>
          </h3>
        </div>
      ) : (
        <h3>
          <Link to='/dashboard'>
            <img width='60%' src='/images/Foodee.svg' alt='logo' />
          </Link>
        </h3>
      )}
    </div>
  );
};
