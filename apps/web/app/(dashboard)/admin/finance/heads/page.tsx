import { auth } from '@/lib/auth';
import { getFeeHeads } from './actions';
import FeeHeadList from './fee-head-list';
import FinanceNav from '../finance-nav';

export default async function FeeHeadsPage() {
    const session = await auth();
    const feeHeads = await getFeeHeads();

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <nav className="flex text-sm font-medium text-slate-500 mb-4">
                    <span>Finance</span>
                    <span className="mx-2">/</span>
                    <span className="text-slate-800">Configuration</span>
                </nav>
                <FinanceNav />
            </div>

            <FeeHeadList feeHeads={feeHeads} />
        </div>
    );
}
