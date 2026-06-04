import { Bell } from 'lucide-react'
import {useAuthStore} from '../store/authStore'


export default function Navbar(){
    const user=useAuthStore((s)=>s.user)

    return(
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
            <div className='text-xl font-bold'>
                <span className='text-blue-600'>Prep</span>
                <span className='text-gray-800'>route</span>
            </div>
            <div className="flex items-center gap-4">
                <button className="relative p-2 rounded-full border border-gray-200 hover:bg-gray-100">
                    <Bell size={18} className='text-gray-600'/>
                </button>
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-400 flex item-center justify-center text-white text-sm font-semibold">
                    A
                </div>
                <div className="text-sm">
                    <div className="front-medium text-gray-800">{user?.name|| "Admin"}</div>
                    <div className="text-gray-400 text-xs">Admin</div>
                </div>
            </div>
            </div>
        </header>
    )
}