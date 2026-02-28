import { Outlet } from 'react-router-dom';
import { PiggyBank } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary/20 via-background to-primary/5 items-center justify-center p-12">
        <div className="text-center space-y-4">
          <PiggyBank className="size-20 mx-auto text-primary" />
          <h2 className="text-2xl font-bold">FinanceHub</h2>
          <p className="text-muted-foreground max-w-sm">
            Track income, expenses, and savings. Stay on top of your financial health.
          </p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
