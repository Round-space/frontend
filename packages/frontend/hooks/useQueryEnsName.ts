import { fetchEnsName } from "@wagmi/core";
import { useQuery } from "react-query";

export function useQueryEnsName(address) {
    const { data } = useQuery(['fetchEnsName', address], async ({ queryKey }) => {
        if( !queryKey[1]  ) return null;
        try {
            const res =  await fetchEnsName({
                address: queryKey[1]
            })
            console.log('ensName', res)
            return res;
        } catch (e) {
            console.log('ensName error', e.message)
            return null;
        }
    }, {
        staleTime: 1000 * 60 * 5,
    })

    return data;
}