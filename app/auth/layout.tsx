import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen items-center justify-center w-full">
    <div className="absolute left-5 top-5">
        <Button variant="outline" asChild>
            <Link href="/">
            <ArrowLeft className="h-6 w-6" />
            Go back
            </Link>
        </Button>
    </div>
      <div className="w-full max-w-md mx-auto">{children}</div>
    </div>
  )
}

export default AuthLayout