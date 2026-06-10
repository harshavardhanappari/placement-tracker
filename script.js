const companyNameInput = document.getElementById('company-name');
const roleInput = document.getElementById('role');
const applicationDateInput = document.getElementById('application-date');
const packageInput = document.getElementById('package');
const notesInput = document.getElementById('notes');
const statusInput = document.getElementById('status');

const addBtn = document.getElementById('add-btn');

const companyList = document.querySelector('.company-list');

const searchInput = document.getElementById('search-input');
const filterStatus = document.getElementById('filter-status');

const totalCount = document.getElementById('total-count');
const selectedCount = document.getElementById('selected-count');
const rejectedCount = document.getElementById('rejected-count');
const interviewCount = document.getElementById('interview-count');
const highestPackage = document.getElementById('highest-package');
const averagePackage = document.getElementById('average-package');

const companies =
    JSON.parse(localStorage.getItem('companies')) || [];

let editingId = null;

renderAllCompanies();
updateStats();

addBtn.addEventListener('click', () => {

    const companyName = companyNameInput.value.trim();
    const role = roleInput.value.trim();
    const applicationDate = applicationDateInput.value;
    const packageValue = packageInput.value;
    const notes = notesInput.value.trim();
    const status = statusInput.value;

    if (!companyName || !role) {
        alert('Please enter Company Name and Role');
        return;
    }

    const duplicate = companies.some(company =>
        company.name.toLowerCase() === companyName.toLowerCase() &&
        company.role.toLowerCase() === role.toLowerCase() &&
        company.id !== editingId
    );

    if (duplicate) {
        alert('This company application already exists');
        return;
    }

    if (editingId !== null) {

        const company = companies.find(
            c => c.id === editingId
        );

        if (company) {
            company.name = companyName;
            company.role = role;
            company.applicationDate = applicationDate || '';
            company.package = packageValue ? Number(packageValue) : null;
            company.notes = notes;
            company.status = status;
        }

        editingId = null;
        addBtn.textContent = 'Add Company';

    } else {

        const company = {
            id: Date.now(),
            name: companyName,
            role: role,
            applicationDate: applicationDate || '',
            package: packageValue ? Number(packageValue) : null,
            notes: notes,
            status: status
        };

        companies.push(company);
    }

    saveCompanies();
    renderAllCompanies();
    updateStats();

    clearForm();
});

function clearForm() {

    companyNameInput.value = '';
    roleInput.value = '';
    applicationDateInput.value = '';
    packageInput.value = '';
    notesInput.value = '';
    statusInput.value = 'Applied';

}

function renderAllCompanies() {

    companyList.innerHTML = '';

    companies.forEach(company => {
        renderCompany(company);
    });

    filterCompanies();
}

function renderCompany(company) {

    const card = document.createElement('div');

    card.classList.add('company-card');

    card.innerHTML = `
        <h3>${company.name}</h3>

        <p>
            <strong>Role:</strong>
            ${company.role}
        </p>

        ${
            company.applicationDate
            ? `
            <p>
                <strong>Applied On:</strong>
                ${company.applicationDate}
            </p>
            `
            : ''
        }

        ${
            company.package
            ? `
            <p>
                <strong>Package:</strong>
                ${company.package} LPA
            </p>
            `
            : ''
        }

        <p>
            <strong>Status:</strong>

            <span class="status-badge ${company.status.replace(/\s+/g, '-')}">
                ${company.status}
            </span>
        </p>

        ${
            company.notes
            ? `
            <div class="notes-box">
                <strong>Notes:</strong><br>
                ${company.notes}
            </div>
            `
            : ''
        }

        <button class="edit-btn">
            Edit
        </button>

        <button class="delete-btn">
            Delete
        </button>
    `;

    const editBtn = card.querySelector('.edit-btn');
    const deleteBtn = card.querySelector('.delete-btn');

    editBtn.addEventListener('click', () => {

        companyNameInput.value = company.name;
        roleInput.value = company.role;
        applicationDateInput.value = company.applicationDate || '';
        packageInput.value = company.package || '';
        notesInput.value = company.notes || '';
        statusInput.value = company.status;

        editingId = company.id;

        addBtn.textContent = 'Update Company';

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

    });

    deleteBtn.addEventListener('click', () => {

        const index = companies.findIndex(
            c => c.id === company.id
        );

        if (index !== -1) {

            companies.splice(index, 1);

            saveCompanies();
            renderAllCompanies();
            updateStats();
        }

    });

    companyList.appendChild(card);
}

function saveCompanies() {

    localStorage.setItem(
        'companies',
        JSON.stringify(companies)
    );
}

function updateStats() {

    totalCount.textContent = companies.length;

    selectedCount.textContent =
        companies.filter(
            company => company.status === 'Selected'
        ).length;

    rejectedCount.textContent =
        companies.filter(
            company => company.status === 'Rejected'
        ).length;

    interviewCount.textContent =
        companies.filter(
            company => company.status === 'Interview'
        ).length;

    const packages = companies
        .filter(company => company.package)
        .map(company => company.package);

    if (packages.length > 0) {

        const highest =
            Math.max(...packages);

        const average =
            (
                packages.reduce(
                    (sum, value) => sum + value,
                    0
                ) / packages.length
            ).toFixed(1);

        highestPackage.textContent =
            `${highest} LPA`;

        averagePackage.textContent =
            `${average} LPA`;

    } else {

        highestPackage.textContent = '0';
        averagePackage.textContent = '0';
    }
}

searchInput.addEventListener(
    'input',
    filterCompanies
);

filterStatus.addEventListener(
    'change',
    filterCompanies
);

function filterCompanies() {

    const searchTerm =
        searchInput.value.toLowerCase();

    const selectedStatus =
        filterStatus.value;

    const cards =
        document.querySelectorAll('.company-card');

    cards.forEach(card => {

        const companyName =
            card.querySelector('h3')
                .textContent
                .toLowerCase();

        const statusText =
            card.querySelector('.status-badge')
                .textContent
                .trim();

        const matchesSearch =
            companyName.includes(searchTerm);

        const matchesStatus =
            selectedStatus === 'All' ||
            statusText === selectedStatus;

        if (matchesSearch && matchesStatus) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }

    });
}