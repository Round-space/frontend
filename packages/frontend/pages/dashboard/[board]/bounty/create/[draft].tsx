import { useRouter } from "next/router";
import NewBounty from "../../../../../components/ui/NewBounty";

export default function CreateDraft() : JSX.Element {
    const router = useRouter()
    const { draft } = router.query;
    
    return (
         <NewBounty draftId={draft}/> 
    )
}