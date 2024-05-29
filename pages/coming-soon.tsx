import { Default } from '../src/components/layouts/Default';
import type { NextPage } from 'next';

const ComingSoonPage: NextPage = () => {
  return (
    <Default pageName="Coming Soon">
        <div className="justify-center flex flex-col text-center">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold">Coming Soon</h1>
            <p className="my-5 text-2xl md:text-3xl lg:text-4xl font-bold">We are working hard to bring you the best experience.</p>
        </div>

    </Default>
  );
};

export default ComingSoonPage;
