import ChatInterface from "@/components/ChatInterface";
import TestComponent from "@/components/TestComponent";

export default function Home() {
  console.log("hello");
  console.log("hello");
  console.log("hello");
  console.log("hello");
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8 lg:p-24">
      <div className="w-full max-w-3xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">Test Page</h1>
        <div className="space-y-8">
          <TestComponent />
          <ChatInterface />
        </div>
      </div>
    </main>
  );
}
