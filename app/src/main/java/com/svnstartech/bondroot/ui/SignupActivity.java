package com.svnstartech.bondroot.ui;

import android.content.Context;
import android.os.Bundle;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputLayout;
import com.svnstartech.bondroot.R;
import com.svnstartech.bondroot.model.Person;
import com.svnstartech.bondroot.repository.PersonRepository;
import com.svnstartech.bondroot.ui.adapter.CandidateAdapter;
import com.svnstartech.bondroot.util.LanguageManager;

import java.util.List;

public class SignupActivity extends AppCompatActivity {

    private EditText etNameLocal, etNameEnglish, etDob, etProfession;
    private Spinner spinnerGender;

    // Father selection views
    private EditText etFatherNameSearch;
    private MaterialButton btnSearchFather;
    private LinearLayout layoutFatherCandidates;
    private RecyclerView rvFatherCandidates;
    private MaterialButton btnFatherNotFound;
    private TextView tvSelectedFatherStatus;

    // Mother selection views
    private EditText etMotherNameSearch;
    private TextInputLayout tilMotherNameSearch;
    private MaterialButton btnSearchMother;
    private LinearLayout layoutMotherCandidates;
    private RecyclerView rvMotherCandidates;
    private MaterialButton btnMotherNotFound;
    private TextView tvSelectedMotherStatus;
    private TextView tvStepMotherTitle, tvMotherSearchDesc, tvCandidateMotherHeader;

    // Account views
    private EditText etEmail, etPassword;
    private MaterialButton btnSubmitSignup;

    private PersonRepository repository;
    private String selectedFatherId = null;
    private String selectedFatherName = null;
    private String selectedMotherId = null;
    private String selectedMotherName = null;

    @Override
    protected void attachBaseContext(Context newBase) {
        super.attachBaseContext(LanguageManager.applyLocale(newBase));
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_signup);

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle(getString(R.string.title_signup));
            toolbar.setNavigationOnClickListener(v -> finish());
        }

        repository = PersonRepository.getInstance(this);

        etNameLocal = findViewById(R.id.etNameLocal);
        etNameEnglish = findViewById(R.id.etNameEnglish);
        etDob = findViewById(R.id.etDob);
        etProfession = findViewById(R.id.etProfession);
        spinnerGender = findViewById(R.id.spinnerGender);

        // Father views
        etFatherNameSearch = findViewById(R.id.etFatherNameSearch);
        btnSearchFather = findViewById(R.id.btnSearchFather);
        layoutFatherCandidates = findViewById(R.id.layoutFatherCandidates);
        rvFatherCandidates = findViewById(R.id.rvFatherCandidates);
        btnFatherNotFound = findViewById(R.id.btnFatherNotFound);
        tvSelectedFatherStatus = findViewById(R.id.tvSelectedFatherStatus);

        // Mother views
        tvStepMotherTitle = findViewById(R.id.tvStepMotherTitle);
        tvMotherSearchDesc = findViewById(R.id.tvMotherSearchDesc);
        tilMotherNameSearch = findViewById(R.id.tilMotherNameSearch);
        etMotherNameSearch = findViewById(R.id.etMotherNameSearch);
        btnSearchMother = findViewById(R.id.btnSearchMother);
        layoutMotherCandidates = findViewById(R.id.layoutMotherCandidates);
        tvCandidateMotherHeader = findViewById(R.id.tvCandidateMotherHeader);
        rvMotherCandidates = findViewById(R.id.rvMotherCandidates);
        btnMotherNotFound = findViewById(R.id.btnMotherNotFound);
        tvSelectedMotherStatus = findViewById(R.id.tvSelectedMotherStatus);

        etEmail = findViewById(R.id.etEmail);
        etPassword = findViewById(R.id.etPassword);
        btnSubmitSignup = findViewById(R.id.btnSubmitSignup);

        boolean isEnglish = LanguageManager.isEnglish(this);

        // Localize initial buttons and labels
        btnSearchFather.setText(getString(R.string.btn_search));
        btnFatherNotFound.setText(getString(R.string.btn_father_not_found));
        tvSelectedFatherStatus.setText(getString(R.string.selected_father_prefix, getString(R.string.no_father_selected)));

        if (tvStepMotherTitle != null) tvStepMotherTitle.setText(getString(R.string.step_mother_selection));
        if (tvMotherSearchDesc != null) tvMotherSearchDesc.setText(getString(R.string.mother_search_desc));
        if (tilMotherNameSearch != null) tilMotherNameSearch.setHint(getString(R.string.hint_mother_name));
        if (btnSearchMother != null) btnSearchMother.setText(getString(R.string.btn_search));
        if (tvCandidateMotherHeader != null) tvCandidateMotherHeader.setText(getString(R.string.candidate_found_mother_header));
        if (btnMotherNotFound != null) btnMotherNotFound.setText(getString(R.string.btn_mother_not_found));
        if (tvSelectedMotherStatus != null) tvSelectedMotherStatus.setText(getString(R.string.selected_mother_prefix, getString(R.string.no_mother_selected)));

        btnSubmitSignup.setText(getString(R.string.btn_complete_signup));

        // Gender spinner
        String[] genderLabels = isEnglish ?
                new String[]{"Male", "Female", "Other"} :
                new String[]{"male (পুরুষ)", "female (নারী)", "other (অন্যান্য)"};
        ArrayAdapter<String> genderAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, genderLabels);
        spinnerGender.setAdapter(genderAdapter);

        rvFatherCandidates.setLayoutManager(new LinearLayoutManager(this));
        rvMotherCandidates.setLayoutManager(new LinearLayoutManager(this));

        // Search father
        btnSearchFather.setOnClickListener(v -> searchFatherCandidates());

        // Father not found -> Create new father
        btnFatherNotFound.setOnClickListener(v -> {
            String typedName = etFatherNameSearch.getText().toString().trim();
            if (typedName.isEmpty()) {
                Toast.makeText(this, isEnglish ? "Enter father's name" : "পিতার নাম লিখুন", Toast.LENGTH_SHORT).show();
                return;
            }
            Person newFather = new Person();
            newFather.setNameLocal(typedName);
            newFather.setNameEnglish(typedName);
            newFather.setGender("male");
            repository.insertPerson(newFather);

            selectedFatherId = newFather.getPersonId();
            selectedFatherName = newFather.getDisplayName(isEnglish);

            String status = isEnglish ?
                    ("Selected Father: " + selectedFatherName + " [Newly Added, ID: " + selectedFatherId + "]") :
                    ("নির্বাচিত পিতা: " + selectedFatherName + " [নতুন যুক্ত হয়েছে, ID: " + selectedFatherId + "]");
            tvSelectedFatherStatus.setText(status);
            layoutFatherCandidates.setVisibility(View.GONE);

            String toastMsg = isEnglish ?
                    ("Added new father record to database: " + selectedFatherId) :
                    ("নতুন পিতা হিসেবে ডাটাবেজে যুক্ত হলো: " + selectedFatherId);
            Toast.makeText(this, toastMsg, Toast.LENGTH_SHORT).show();
        });

        // Search mother
        btnSearchMother.setOnClickListener(v -> searchMotherCandidates());

        // Mother not found -> Create new mother
        btnMotherNotFound.setOnClickListener(v -> {
            String typedName = etMotherNameSearch.getText().toString().trim();
            if (typedName.isEmpty()) {
                Toast.makeText(this, isEnglish ? "Enter mother's name" : "মাতার নাম লিখুন", Toast.LENGTH_SHORT).show();
                return;
            }
            Person newMother = new Person();
            newMother.setNameLocal(typedName);
            newMother.setNameEnglish(typedName);
            newMother.setGender("female");
            repository.insertPerson(newMother);

            selectedMotherId = newMother.getPersonId();
            selectedMotherName = newMother.getDisplayName(isEnglish);

            String status = isEnglish ?
                    ("Selected Mother: " + selectedMotherName + " [Newly Added, ID: " + selectedMotherId + "]") :
                    ("নির্বাচিত মাতা: " + selectedMotherName + " [নতুন যুক্ত হয়েছে, ID: " + selectedMotherId + "]");
            tvSelectedMotherStatus.setText(status);
            layoutMotherCandidates.setVisibility(View.GONE);

            String toastMsg = isEnglish ?
                    ("Added new mother record to database: " + selectedMotherId) :
                    ("নতুন মাতা হিসেবে ডাটাবেজে যুক্ত হলো: " + selectedMotherId);
            Toast.makeText(this, toastMsg, Toast.LENGTH_SHORT).show();
        });

        // Submit registration
        btnSubmitSignup.setOnClickListener(v -> submitRegistration());
    }

    private void searchFatherCandidates() {
        boolean isEnglish = LanguageManager.isEnglish(this);
        String query = etFatherNameSearch.getText().toString().trim();
        if (query.isEmpty()) {
            Toast.makeText(this, isEnglish ? "Please enter father's name to search" : "অনুসন্ধান করতে পিতার নাম লিখুন", Toast.LENGTH_SHORT).show();
            return;
        }

        List<Person> candidates = repository.searchCandidates(query, "male");
        layoutFatherCandidates.setVisibility(View.VISIBLE);

        if (candidates.isEmpty()) {
            String msg = isEnglish ?
                    "No match found with this name. You can click 'Add as New Father'." :
                    "এই নামে কোনো পিতা পাওয়া যায়নি। আপনি নতুন পিতা যোগ করতে পারেন।";
            Toast.makeText(this, msg, Toast.LENGTH_LONG).show();
        }

        CandidateAdapter adapter = new CandidateAdapter(candidates, repository, candidate -> {
            selectedFatherId = candidate.getPersonId();
            selectedFatherName = candidate.getDisplayName(isEnglish);
            String status = isEnglish ?
                    ("Selected Father: " + selectedFatherName + " [Existing DB, ID: " + selectedFatherId + "]") :
                    ("নির্বাচিত পিতা: " + selectedFatherName + " [বিদ্যমান ডাটাবেজ, ID: " + selectedFatherId + "]");
            tvSelectedFatherStatus.setText(status);
            layoutFatherCandidates.setVisibility(View.GONE);

            String toast = isEnglish ? ("Father selected: " + selectedFatherName) : ("পিতা নির্বাচিত: " + selectedFatherName);
            Toast.makeText(this, toast, Toast.LENGTH_SHORT).show();
        });
        rvFatherCandidates.setAdapter(adapter);
    }

    private void searchMotherCandidates() {
        boolean isEnglish = LanguageManager.isEnglish(this);
        String query = etMotherNameSearch.getText().toString().trim();
        if (query.isEmpty()) {
            Toast.makeText(this, isEnglish ? "Please enter mother's name to search" : "অনুসন্ধান করতে মাতার নাম লিখুন", Toast.LENGTH_SHORT).show();
            return;
        }

        List<Person> candidates = repository.searchCandidates(query, "female");
        layoutMotherCandidates.setVisibility(View.VISIBLE);

        if (candidates.isEmpty()) {
            String msg = isEnglish ?
                    "No match found with this name. You can click 'Add as New Mother'." :
                    "এই নামে কোনো মাতা পাওয়া যায়নি। আপনি নতুন মাতা যোগ করতে পারেন।";
            Toast.makeText(this, msg, Toast.LENGTH_LONG).show();
        }

        CandidateAdapter adapter = new CandidateAdapter(candidates, repository, candidate -> {
            selectedMotherId = candidate.getPersonId();
            selectedMotherName = candidate.getDisplayName(isEnglish);
            String status = isEnglish ?
                    ("Selected Mother: " + selectedMotherName + " [Existing DB, ID: " + selectedMotherId + "]") :
                    ("নির্বাচিত মাতা: " + selectedMotherName + " [বিদ্যমান ডাটাবেজ, ID: " + selectedMotherId + "]");
            tvSelectedMotherStatus.setText(status);
            layoutMotherCandidates.setVisibility(View.GONE);

            String toast = isEnglish ? ("Mother selected: " + selectedMotherName) : ("মাতা নির্বাচিত: " + selectedMotherName);
            Toast.makeText(this, toast, Toast.LENGTH_SHORT).show();
        });
        rvMotherCandidates.setAdapter(adapter);
    }

    private void submitRegistration() {
        boolean isEnglish = LanguageManager.isEnglish(this);
        String localName = etNameLocal.getText().toString().trim();
        String englishName = etNameEnglish.getText().toString().trim();
        String email = etEmail.getText().toString().trim();
        String password = etPassword.getText().toString().trim();
        String dob = etDob.getText().toString().trim();
        String profession = etProfession.getText().toString().trim();

        if (localName.isEmpty() && englishName.isEmpty()) {
            etNameLocal.setError(isEnglish ? "Name is required" : "নাম প্রয়োজন");
            return;
        }
        if (email.isEmpty()) {
            etEmail.setError(isEnglish ? "Email is required" : "ইমেইল প্রয়োজন");
            return;
        }
        if (password.isEmpty()) {
            etPassword.setError(isEnglish ? "Password is required" : "পাসওয়ার্ড প্রয়োজন");
            return;
        }

        String gender = spinnerGender.getSelectedItemPosition() == 1 ? "female" : "male";

        // Create Person record with both fatherId and motherId
        Person newPerson = new Person();
        newPerson.setNameLocal(!localName.isEmpty() ? localName : englishName);
        newPerson.setNameEnglish(!englishName.isEmpty() ? englishName : localName);
        newPerson.setGender(gender);
        newPerson.setDateOfBirth(dob);
        newPerson.setProfession(profession);
        newPerson.setEmail(email);
        newPerson.setFatherId(selectedFatherId);
        newPerson.setMotherId(selectedMotherId);

        boolean success = repository.registerUser(email, password, newPerson);
        if (success) {
            String msg = isEnglish ?
                    ("Congratulations! Registration complete. Your Person ID: " + newPerson.getPersonId()) :
                    ("অভিনন্দন! রেজিস্ট্রেশন সফল হয়েছে। আপনার Person ID: " + newPerson.getPersonId());
            Toast.makeText(this, msg, Toast.LENGTH_LONG).show();
            finish();
        } else {
            Toast.makeText(this, isEnglish ? "Registration failed. Try a different email." : "রেজিস্ট্রেশন ব্যর্থ হয়েছে। অন্য ইমেইল ব্যবহার করুন।", Toast.LENGTH_SHORT).show();
        }
    }
}
