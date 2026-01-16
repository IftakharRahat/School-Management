import { getBranchesForAdmission } from './actions';
import AdmissionForm from './admission-form';

export default async function AdmissionPage() {
    const branches = await getBranchesForAdmission();

    return <AdmissionForm branches={branches} />;
}
