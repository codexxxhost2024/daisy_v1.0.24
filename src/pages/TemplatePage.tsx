
import React from 'react';
import Header from '@/components/Header';
import BottomNavbar from '@/components/BottomNavbar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Check, Star, BookOpen, Stethoscope, Heart, Clipboard, Pill, UserRound } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock template data
const templates = [
  {
    id: '1',
    title: 'SOAP Note',
    description: 'Standard format for medical documentation including Subjective, Objective, Assessment, and Plan sections.',
    category: 'general',
    isPopular: true
  },
  {
    id: '2',
    title: 'H&P (History & Physical)',
    description: 'Comprehensive documentation of patient history and physical examination findings.',
    category: 'general',
    isPopular: true
  },
  {
    id: '3',
    title: 'Progress Note',
    description: 'Follow-up documentation of ongoing patient care and condition changes.',
    category: 'general',
    isPopular: false
  },
  {
    id: '4',
    title: 'Cardiology Consultation',
    description: 'Specialized template for cardiac evaluation and recommendations.',
    category: 'specialty',
    isPopular: false
  },
  {
    id: '5',
    title: 'Psychiatric Evaluation',
    description: 'Comprehensive mental health assessment and treatment plan.',
    category: 'specialty',
    isPopular: false
  },
  {
    id: '6',
    title: 'Pediatric Well Visit',
    description: 'Age-specific developmental assessment and preventive care for children.',
    category: 'specialty',
    isPopular: true
  },
  {
    id: '7',
    title: 'Discharge Summary',
    description: 'Documentation summarizing hospital stay and follow-up instructions.',
    category: 'administrative',
    isPopular: false
  },
  {
    id: '8',
    title: 'Procedure Note',
    description: 'Detailed documentation of medical procedures performed.',
    category: 'administrative',
    isPopular: false
  }
];

const TemplatePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto pt-20 pb-24 px-4 overflow-y-auto">
        {/* Removed redundant header text div */}
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input placeholder="Search templates..." className="pl-10" />
        </div>
        
        <Tabs defaultValue="all" className="mb-6">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="specialty">Specialty</TabsTrigger>
            <TabsTrigger value="administrative">Admin</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <Card key={template.id} className="shadow-sm hover:shadow transition-shadow">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-semibold flex items-center">
                        {template.title}
                        {template.isPopular && <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Popular</span>}
                      </CardTitle>
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="p-4 pt-2 flex justify-end">
                    <Button size="sm">Select Template</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.filter(t => t.category === 'general').map((template) => (
                <Card key={template.id} className="shadow-sm hover:shadow transition-shadow">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-semibold flex items-center">
                        {template.title}
                        {template.isPopular && <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Popular</span>}
                      </CardTitle>
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="p-4 pt-2 flex justify-end">
                    <Button size="sm">Select Template</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="specialty" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.filter(t => t.category === 'specialty').map((template) => (
                <Card key={template.id} className="shadow-sm hover:shadow transition-shadow">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-semibold flex items-center">
                        {template.title}
                        {template.isPopular && <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Popular</span>}
                      </CardTitle>
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="p-4 pt-2 flex justify-end">
                    <Button size="sm">Select Template</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="administrative" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.filter(t => t.category === 'administrative').map((template) => (
                <Card key={template.id} className="shadow-sm hover:shadow transition-shadow">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-semibold flex items-center">
                        {template.title}
                        {template.isPopular && <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Popular</span>}
                      </CardTitle>
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="p-4 pt-2 flex justify-end">
                    <Button size="sm">Select Template</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Popular Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="text-center p-4 flex flex-col items-center shadow-sm hover:shadow transition-shadow">
              <Stethoscope className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-base">General Practice</CardTitle>
            </Card>
            <Card className="text-center p-4 flex flex-col items-center shadow-sm hover:shadow transition-shadow">
              <Heart className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-base">Cardiology</CardTitle>
            </Card>
            <Card className="text-center p-4 flex flex-col items-center shadow-sm hover:shadow transition-shadow">
              <Clipboard className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-base">Admin Forms</CardTitle>
            </Card>
            <Card className="text-center p-4 flex flex-col items-center shadow-sm hover:shadow transition-shadow">
              <UserRound className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-base">Pediatrics</CardTitle>
            </Card>
          </div>
        </div>
      </main>
      
      <BottomNavbar />
    </div>
  );
};

export default TemplatePage;
